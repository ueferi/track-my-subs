/** API成功レスポンス */
export interface ApiSuccessResponse<T> {
	success: true;
	data: T;
}

/** APIエラーレスポンス */
export interface ApiErrorResponse {
	success: false;
	error: string;
}

/** 統一APIレスポンス */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
