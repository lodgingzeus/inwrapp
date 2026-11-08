import { normalizeAll } from './records'
import { fixMojibake } from './text'

export interface Profile {
  name: string | null
  username: string | null
}

/** personal_information.json: {profile_user: [{string_map_data: {Name, Username, …}}]} */
export function parseProfile(json: unknown): Profile {
  const rec = normalizeAll(json)[0]
  const name = rec?.fields.Name
  const username = rec?.fields.Username
  return {
    name: name ? fixMojibake(name) : null,
    username: username ? fixMojibake(username) : null,
  }
}
