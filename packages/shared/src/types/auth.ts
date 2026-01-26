import type { User } from "./entity.js";

/** ユーザー登録リクエスト */
export interface RegisterRequest {
	email: string;
	password: string;
}

/** ログインリクエスト */
export interface LoginRequest {
	email: string;
	password: string;
}

/** 認証レスポンス（トークン付き） */
export interface AuthResponse {
	user: User;
	token: string;
}
