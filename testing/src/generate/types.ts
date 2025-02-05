import { KeyValType, TestRequest } from "../types/test"
import { AuthType, RestMethod } from "../types/enums"
import { DataSection, DataType } from "./enums"

export interface GenTestEndpointDataField {
  dataSection: DataSection
  arrayFields: Record<string, number>
  contentType: string
  dataPath: string
  dataType: DataType
  traceHash: Record<string, number>
  entity?: string
}

export interface GenTestEndpointAuthConfig {
  authType: AuthType
  headerKey: string
  jwtUserPath: string
  cookieName: string
}

export interface GenTestEndpoint {
  uuid?: string
  host: string
  path: string
  method: RestMethod
  dataFields: GenTestEndpointDataField[]
  authConfig?: GenTestEndpointAuthConfig
}

export interface GenTestContext {
  endpoint: GenTestEndpoint
  entityMap: Record<string, any>
  prefix?: string
  reason?: string
}

export interface GeneratedTestRequest {
  req: TestRequest
  env: KeyValType[]
}
