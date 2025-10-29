import Api from "@/lib/api"

export interface ContactType {
  id: number
  code: string
  name: string
}

export interface AddressType {
  id: number
  code: string
  name: string
}

export interface Unity {
  id: number
  code: string
  name: string
}

const contactTypeApi = new Api<ContactType, number>("/contact-type")
const addressTypeApi = new Api<AddressType, number>("/address-type")
const unityApi = new Api<Unity, number>("/unity")

// Contact Types
export const getContactTypes = (): Promise<ContactType[]> =>
  contactTypeApi.list(0, 100)

// Address Types
export const getAddressTypes = (): Promise<AddressType[]> =>
  addressTypeApi.list(0, 100)

// Unities
export const getUnities = (): Promise<Unity[]> =>
  unityApi.list(0, 100)
