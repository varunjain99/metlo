import { Request, Response } from "express";
import { LogRequestService } from "services/log-request";
import { TraceParams } from "types";
import ApiResponseHandler from "api-response-handler";

export const logRequestSingleHandler = async (req: Request, res: Response) => {
  const traceParams: TraceParams = req.body;
  try {
    await LogRequestService.logRequest(traceParams);
    await ApiResponseHandler.success(res, null);
  } catch (err) {
    await ApiResponseHandler.error(res, err);
  }
};

export const logRequestBatchHandler = async (req: Request, res: Response) => {
  const traceParamsBatch: TraceParams[] = req.body;
  try {
    await LogRequestService.logRequestBatch(traceParamsBatch);
    await ApiResponseHandler.success(res, null);
  } catch (err) {
    await ApiResponseHandler.error(res, err);
  }
};
