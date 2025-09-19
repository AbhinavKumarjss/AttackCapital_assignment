export function cleanTranscript(transcript){
    let cleanedTranscript = [];
    if (Array.isArray(transcript) && transcript.length > 0) {
      cleanedTranscript = transcript.filter(entry => {
        if (!Array.isArray(entry) || entry.length < 2) return false;
        const message = entry[1];
        return message && 
               typeof message === 'string' && 
               message.trim().length > 0;
      });
    }
    return cleanedTranscript;
}