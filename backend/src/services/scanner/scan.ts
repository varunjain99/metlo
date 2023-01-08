import { __DataClass_INTERNAL__ } from "@common/enums"
import {
  ADDRESS_REGEXP,
  COORDINATE_REGEXP,
  CREDIT_CARD_REGEXP,
  DOB_REGEXP,
  EMAIL_REGEXP,
  IP_ADDRESS_REGEXP,
  PHONE_NUMBER_REGEXP,
  SSN_REGEXP,
  VIN_REGEXP,
} from "services/scanner/regexp"
import { MetloContext } from "types"
import { getCombinedDataClasses } from "services/data-classes"

export const __DATA_CLASS_REGEX_MAP_INTERNAL__ = {
  [__DataClass_INTERNAL__.ADDRESS]: ADDRESS_REGEXP,
  [__DataClass_INTERNAL__.COORDINATE]: COORDINATE_REGEXP,
  [__DataClass_INTERNAL__.CREDIT_CARD]: CREDIT_CARD_REGEXP,
  [__DataClass_INTERNAL__.DOB]: DOB_REGEXP,
  [__DataClass_INTERNAL__.EMAIL]: EMAIL_REGEXP,
  [__DataClass_INTERNAL__.IP_ADDRESS]: IP_ADDRESS_REGEXP,
  [__DataClass_INTERNAL__.PHONE_NUMBER]: PHONE_NUMBER_REGEXP,
  [__DataClass_INTERNAL__.SSN]: SSN_REGEXP,
  [__DataClass_INTERNAL__.VIN]: VIN_REGEXP,
}

const STRING_ONLY_DATA_CLASSES: string[] = [
  __DataClass_INTERNAL__.PHONE_NUMBER,
  __DataClass_INTERNAL__.ADDRESS,
  __DataClass_INTERNAL__.COORDINATE,
  __DataClass_INTERNAL__.IP_ADDRESS,
  __DataClass_INTERNAL__.EMAIL,
  __DataClass_INTERNAL__.DOB,
]

export const scan = async (ctx: MetloContext, text: any): Promise<string[]> => {
  const res: string[] = []
  let convertedText: string
  try {
    convertedText = text.toString()
  } catch (err) {
    return res
  }

  const DataClassInfo = await getCombinedDataClasses(ctx)

  DataClassInfo.forEach(({ className, regex: exp }) => {
    if (exp) {
      if (
        STRING_ONLY_DATA_CLASSES.includes(className) &&
        typeof text !== "string"
      ) {
        return
      }
      const match = new RegExp(exp).test(convertedText)
      if (match) {
        res.push(className)
      }
    }
  })
  return res
}
