export type UseDataResponse<T> = {
  data: T[] | T
  error?: Error
  url: string
}
