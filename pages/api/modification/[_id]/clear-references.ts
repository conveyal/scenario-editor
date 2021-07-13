/**
 * When deleting a modification it might have been referenced from other
 * modifications. Ensure that those references are cleared.
 * TODO replicate on the server side.
 *
 export const clearReferencesToModification =
 ({_id, modifications}) =>
 (dispatch) => {
   const timetableMatches = (tt) =>
     tt.phaseFromTimetable && tt.phaseFromTimetable.split(':')[0] === _id
   const referencesModification = (tts) =>
     tts && tts.length > 0 && !!tts.find(timetableMatches)
   const clearTimetableReferences = (tt) =>
     timetableMatches(tt)
       ? {...tt, phaseFromTimetable: null, phaseFromStop: null}
       : tt

   return Promise.all(
     modifications
       .filter((m) => referencesModification(m.entries || m.timetables))
       .map((m) =>
         m.entries
           ? dispatch(
               saveToServer({
                 ...m,
                 entries: m.entries.map(clearTimetableReferences)
               })
             )
           : dispatch(
               saveToServer({
                 ...m,
                 timetables: m.timetables.map(clearTimetableReferences)
               })
             )
       )
   )
 }
 */

export default function clearReferencesToModification() {}
