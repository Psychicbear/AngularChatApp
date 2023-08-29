type Role = Record<string, number>
export interface User {
    id?: string,
    username?: string,
    email?: string,
    roles?: [Role],
    groups?: [string]
}