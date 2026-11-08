// Instagram writes some events into DMs as plain message text. These patterns
// only match exports in English; in other languages the lines are counted as
// ordinary messages, which is a small, acceptable error.

/** Notifications, not messages anyone typed. Not counted as sent or received. */
const NOTIFICATIONS = [
  /^Reacted .+ to your message\s*$/,
  /^.+ reacted .+ to your message\s*$/,
  /^Liked a message\s*$/,
]

/** Placeholder text on shares and media. Counted as messages, but holds no typed words. */
const PLACEHOLDERS = [/ sent an attachment\.\s*$/, /^You sent an attachment\.\s*$/, / (started|ended) (a )?(video|audio) chat/i]

export function isNotification(text: string): boolean {
  return NOTIFICATIONS.some((re) => re.test(text))
}

export function isPlaceholder(text: string): boolean {
  return PLACEHOLDERS.some((re) => re.test(text))
}
