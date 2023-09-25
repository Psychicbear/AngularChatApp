type Role = Record<string, number>
export interface User {
    _id: string,
    username: string,
    email: string,
    roles: Roles,
    groups: string[]
}

export interface Roles {
    global: string
}