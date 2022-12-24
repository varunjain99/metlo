import validator from "validator"
import { QueryRunner } from "typeorm"
import { ApiEndpoint, DataField } from "models"
import { pathParameterRegex } from "~/constants"
import { DataType, RiskScore } from "@common/enums"
import wordJson from "./words.json"
import { getPathTokens } from "@common/utils"

export const isDevelopment = process.env.NODE_ENV === "development"
export const runMigration = process.env.RUN_MIGRATION === "true"

export const getExistingConstraint = (
  queryRunner: QueryRunner,
  constraintName: string,
  tableName: string,
) =>
  queryRunner.query(
    "SELECT 1 FROM information_schema.table_constraints WHERE constraint_name=$1 AND table_name=$2",
    [constraintName, tableName],
  )

export const isSuspectedParamater = (value: string): boolean => {
  if (!isNaN(Number(value))) {
    return true
  }
  if (validator.isUUID(value)) {
    return true
  }
  const splitParam = value.split(/[-_]/)
  for (const token of splitParam) {
    if (!wordJson[token]) {
      return true
    }
  }
  return false
}

export const skipAutoGeneratedMatch = (
  apiEndpoint: ApiEndpoint,
  tracePath: string,
) => {
  if (!apiEndpoint.openapiSpec || apiEndpoint.openapiSpec?.isAutoGenerated) {
    const pathTokens = getPathTokens(tracePath)
    let paramNum = 0
    pathTokens.forEach(token => {
      if (isSuspectedParamater(token)) paramNum += 1
    })
    if (
      paramNum < apiEndpoint.numberParams ||
      (paramNum === 0 && tracePath !== apiEndpoint.path)
    ) {
      return true
    }
  }
  return false
}

export const isParameter = (token: string): boolean => {
  if (!token) {
    return false
  }
  return token.startsWith("{") && token.endsWith("}")
}

export const getPathRegex = (path: string): string => {
  return String.raw`^${path.replace(
    pathParameterRegex,
    String.raw`/[^/]+`,
  )}(/)*$`
}

export const getRiskScore = (dataFields: DataField[]): RiskScore => {
  if (!dataFields) {
    return RiskScore.NONE
  }
  let uniqueSensitiveDataClasses = new Set<string>()
  for (const dataField of dataFields) {
    if (dataField.dataClasses) {
      dataField.dataClasses.forEach(e => uniqueSensitiveDataClasses.add(e))
    }
  }
  const numRiskySensitiveDataClasses = uniqueSensitiveDataClasses.size
  switch (true) {
    case numRiskySensitiveDataClasses >= 3:
      return RiskScore.HIGH
    case numRiskySensitiveDataClasses >= 2:
      return RiskScore.MEDIUM
    case numRiskySensitiveDataClasses >= 1:
      return RiskScore.LOW
    default:
      return RiskScore.NONE
  }
}

export const getDataType = (data: any): DataType => {
  if (data === undefined || data === null) {
    return DataType.UNKNOWN
  }
  if (typeof data === "boolean") {
    return DataType.BOOLEAN
  }
  if (typeof data === "number") {
    if (Number.isInteger(data)) {
      return DataType.INTEGER
    }
    return DataType.NUMBER
  }
  if (Array.isArray(data)) {
    return DataType.ARRAY
  }
  if (typeof data === "object") {
    return DataType.OBJECT
  }
  return DataType.STRING
}

export const parsedJson = (jsonString: string): any => {
  try {
    if (typeof jsonString === "object" || Array.isArray(jsonString)) {
      return jsonString
    }
    const parsed = JSON.parse(jsonString)
    const isNonScalar = typeof parsed === "object" || Array.isArray(parsed)
    return isNonScalar ? parsed : null
  } catch (err) {
    return null
  }
}

export const parsedJsonNonNull = (
  jsonString: string,
  returnString?: boolean,
): any => {
  try {
    if (typeof jsonString === "object" || Array.isArray(jsonString)) {
      return jsonString
    }
    const parsed = JSON.parse(jsonString)
    const isNonScalar = typeof parsed === "object" || Array.isArray(parsed)
    return isNonScalar ? parsed : jsonString
  } catch (err) {
    if (returnString) {
      return jsonString
    }
    return {}
  }
}

export const inSandboxMode =
  (process.env.SANDBOX_MODE || "false").toLowerCase() == "true"

export const endpointUpdateDates = (
  traceCreatedDate: Date,
  apiEndpoint: ApiEndpoint,
) => {
  if (!apiEndpoint.firstDetected) {
    apiEndpoint.firstDetected = traceCreatedDate
  }
  if (!apiEndpoint.lastActive) {
    apiEndpoint.lastActive = traceCreatedDate
  }

  if (traceCreatedDate && traceCreatedDate < apiEndpoint.firstDetected) {
    apiEndpoint.firstDetected = traceCreatedDate
  }
  if (traceCreatedDate && traceCreatedDate > apiEndpoint.lastActive) {
    apiEndpoint.lastActive = traceCreatedDate
  }
}

export const endpointAddNumberParams = (apiEndpoint: ApiEndpoint) => {
  if (apiEndpoint.path) {
    const pathTokens = getPathTokens(apiEndpoint.path)
    let numParams = 0
    for (let i = 0; i < pathTokens.length; i++) {
      const token = pathTokens[i]
      if (isParameter(token)) {
        numParams += 1
      }
    }
    apiEndpoint.numberParams = numParams
  }
}

export const getValidPath = (
  path: string,
  requiredNumTokens?: number,
): { isValid: boolean; path: string; errMsg: string } => {
  if (!path) return { isValid: false, path: "", errMsg: "No path provided." }
  if (!path.startsWith("/"))
    return {
      isValid: false,
      path: "",
      errMsg: "Path does not start with a leading slash.",
    }

  const invalidCharacterRegex = new RegExp(/[\\?<>&=]/)
  if (invalidCharacterRegex.test(path)) {
    return {
      isValid: false,
      path: "",
      errMsg: "Path contains an invalid character.",
    }
  }

  const tokens = path.split("/")
  let emptyTokens = 0
  const validPathTokens = []

  if (path === "/") {
    if (requiredNumTokens && requiredNumTokens > 0) {
      return {
        isValid: false,
        path: "",
        errMsg: "Path does not match endpoint length",
      }
    }
    return { isValid: true, path: "/", errMsg: "" }
  }

  for (const token of tokens) {
    if (token.length === 0) emptyTokens += 1
    else validPathTokens.push(token)
  }

  if (emptyTokens > 2) {
    return {
      isValid: false,
      path: "",
      errMsg: "Too many trailing or leading slashes in path.",
    }
  }

  const validPath = `/${validPathTokens.join("/")}`
  const numTokens = getPathTokens(validPath).length

  if (requiredNumTokens && numTokens !== requiredNumTokens) {
    return {
      isValid: false,
      path: "",
      errMsg:
        "Path does not have the same number of tokens as the current path.",
    }
  }

  return { isValid: true, path: validPath, errMsg: "" }
}
