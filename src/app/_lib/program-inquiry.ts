/** Programme inquiry handoff shared by the carousel and form prefill. */
export const PROGRAM_INQUIRE_EVENT = "ad:program-inquire"
export type ProgramInquiryDetail = { key?: unknown }
export function dispatchProgramInquiry(key: string) {
  window.dispatchEvent(
    new CustomEvent<ProgramInquiryDetail>(PROGRAM_INQUIRE_EVENT, {
      detail: { key },
    })
  )
}
