export type TokenPair = {
  access_token: string
  refresh_token: string
}

export type APIErrorBody = {
  error?: {
    message?: string
    code?: string
  }
}
