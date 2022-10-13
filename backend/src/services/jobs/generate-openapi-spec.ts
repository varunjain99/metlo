import { IsNull } from "typeorm"
import { SpecExtension } from "@common/enums"
import { ApiEndpoint, OpenApiSpec, ApiTrace } from "models"
import { AppDataSource } from "data-source"
import { DatabaseService } from "services/database"
import { getPathTokens } from "@common/utils"
import { isParameter, parsedJsonNonNull } from "utils"
import { BodySchema, BodyContent, Responses } from "./types"
import { parseSchema, parseContent } from "./utils"

const generateOpenApiSpec = async (): Promise<void> => {
  console.log("Generating OpenAPI Spec Files...")
  try {
    const apiEndpointRepository = AppDataSource.getRepository(ApiEndpoint)
    const openApiSpecRepository = AppDataSource.getRepository(OpenApiSpec)
    const apiTraceRepository = AppDataSource.getRepository(ApiTrace)
    const nonSpecEndpoints = await apiEndpointRepository.findBy({
      openapiSpecName: IsNull(),
    })
    const currTime = new Date()
    const hostMap: Record<string, ApiEndpoint[]> = {}
    const specIntro = {
      openapi: "3.0.0",
      info: {
        title: "OpenAPI 3.0 Spec",
        version: "1.0.0",
        description: "An auto-generated OpenAPI 3.0 specification.",
      },
    }
    for (let i = 0; i < nonSpecEndpoints.length; i++) {
      const endpoint = nonSpecEndpoints[i]
      if (hostMap[endpoint.host]) {
        hostMap[endpoint.host].push(endpoint)
      } else {
        hostMap[endpoint.host] = [endpoint]
      }
    }
    for (const host in hostMap) {
      let spec = await openApiSpecRepository.findOneBy({
        name: `${host}-generated`,
      })
      let openApiSpec = {}
      if (spec) {
        openApiSpec = JSON.parse(spec.spec)
      } else {
        spec = new OpenApiSpec()
        spec.name = `${host}-generated`
        spec.isAutoGenerated = true
        spec.hosts = [host]
        openApiSpec = {
          ...specIntro,
          servers: [
            {
              url: host,
            },
          ],
          paths: {},
        }
      }
      const endpoints = hostMap[host]
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i]
        const paths = openApiSpec["paths"]
        const path = endpoint.path
        const method = endpoint.method.toLowerCase()
        const tracesQb = apiTraceRepository
          .createQueryBuilder()
          .where('"apiEndpointUuid" = :id', { id: endpoint.uuid })
        if (spec.specUpdatedAt) {
          tracesQb.andWhere('"createdAt" > :updated', {
            updated: spec.specUpdatedAt,
          })
          tracesQb.andWhere('"createdAt" <= :curr', { curr: currTime })
        } else {
          tracesQb.andWhere('"createdAt" <= :curr', { curr: currTime })
        }
        const traces = await tracesQb.orderBy('"createdAt"', "ASC").getMany()

        let parameters: Record<string, BodySchema> = {}
        let requestBodySpec: BodyContent = {}
        let responses: Responses = {}
        if (paths[path]) {
          if (paths[path][method]) {
            const specParameters = paths[path][method]["parameters"] ?? []
            requestBodySpec =
              paths[path][method]["requestBody"]?.["content"] ?? {}
            responses = paths[path][method]["responses"] ?? {}
            for (const parameter of specParameters) {
              parameters[`${parameter?.name}<>${parameter?.in}`] =
                parameter?.schema ?? {}
            }
          } else {
            paths[path][method] = {}
          }
        } else {
          paths[path] = {
            [method]: {},
          }
        }

        for (const trace of traces) {
          const requestParamters = trace.requestParameters
          const requestHeaders = trace.requestHeaders
          const requestBody = trace.requestBody
          const responseHeaders = trace.responseHeaders
          const responseBody = trace.responseBody
          const responseStatusString =
            trace.responseStatus?.toString() || "default"
          let requestContentType = null
          let responseContentType = null
          const endpointTokens = getPathTokens(endpoint.path)
          const traceTokens = getPathTokens(trace.path)
          for (let i = 0; i < endpointTokens.length; i++) {
            const currToken = endpointTokens[i]
            if (isParameter(currToken)) {
              const key = `${currToken.slice(1, -1)}<>path`
              parameters[key] = parseSchema(
                parameters[key] ?? {},
                parsedJsonNonNull(traceTokens[i], true),
              )
            }
          }
          for (const requestParameter of requestParamters) {
            const key = `${requestParameter.name}<>query`
            parameters[key] = parseSchema(
              parameters[key] ?? {},
              parsedJsonNonNull(requestParameter.value, true),
            )
          }
          for (const requestHeader of requestHeaders) {
            const key = `${requestHeader.name}<>header`
            parameters[key] = parseSchema(
              parameters[key] ?? {},
              parsedJsonNonNull(requestHeader.value, true),
            )
            if (requestHeader.name.toLowerCase() === "content-type") {
              requestContentType = requestHeader.value.toLowerCase()
            }
          }
          for (const responseHeader of responseHeaders) {
            if (responseHeader.name.toLowerCase() === "content-type") {
              responseContentType = responseHeader.value.toLowerCase()
            }
            if (!responses[responseStatusString]?.headers) {
              responses[responseStatusString] = {
                description: `${responseStatusString} description`,
                ...responses[responseStatusString],
                headers: {},
              }
            }
            parseContent(
              responses[responseStatusString]?.headers,
              responseHeader.value,
              responseHeader.name,
            )
          }

          parseContent(requestBodySpec, requestBody, requestContentType)
          if (responseBody) {
            if (!responses[responseStatusString]?.content) {
              responses[responseStatusString] = {
                description: `${responseStatusString} description`,
                ...responses[responseStatusString],
                content: {},
              }
            }
            parseContent(
              responses[responseStatusString]?.content,
              responseBody,
              responseContentType,
            )
          }
        }
        let specParameterList = []
        for (const parameter in parameters) {
          const splitParameter = parameter.split("<>")
          specParameterList.push({
            name: splitParameter[0],
            in: splitParameter[1],
            schema: parameters[parameter],
          })
        }
        if (specParameterList.length > 0) {
          paths[path][method]["parameters"] = specParameterList
        }
        if (Object.keys(requestBodySpec).length > 0) {
          paths[path][method]["requestBody"] = {
            content: {
              ...requestBodySpec,
            },
          }
        }
        if (Object.keys(responses).length > 0) {
          paths[path][method]["responses"] = {
            ...responses,
          }
        }

        endpoint.openapiSpec = spec
      }
      spec.spec = JSON.stringify(openApiSpec, null, 2)
      if (!spec.createdAt) {
        spec.createdAt = currTime
      }
      spec.updatedAt = currTime
      spec.specUpdatedAt = currTime
      spec.extension = SpecExtension.JSON
      await DatabaseService.executeTransactions([[spec], endpoints], [], true)
    }
  } catch (err) {
    console.error(`Encountered error while generating OpenAPI specs: ${err}`)
  }
}

export default generateOpenApiSpec
