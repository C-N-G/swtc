export default function convertTime(seconds) {
  
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }

  let minutes = Math.floor(seconds/60);
  let returnSeconds = Math.floor(seconds - minutes*60);
  if (returnSeconds < 10) returnSeconds = '0' + returnSeconds;

  if (minutes < 60) {
    return `${minutes}m:${returnSeconds}s`;
  }

  let hours = Math.floor(seconds/60/60);
  minutes -= hours*60;
  if (minutes < 10) minutes = '0' + minutes;
  return `${hours}h:${minutes}s:${returnSeconds}m`;

}