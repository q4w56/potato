const YYMMDD = d => `${d.getUTCFullYear()}/${d.getUTCMonth()+1}/${d.getUTCDate()}`
const MMDD = d => `${d.getUTCMonth()+1}/${d.getUTCDate()}`

const dateStringify = (date) => {
  if (!date) throw 'parameter is required'
  const diff = new Date() - date
  const minute = 1000*60
  const hour = minute*60
  const day = hour*24
  const year = day * 365
  if (diff < minute) {
    return 'now'
  }
  if (diff < 2 * hour) {
    return  ~~ (diff/minute) + 'min'
  }
  if (diff < 2 * day) {
    return ~~ (diff/hour) + 'h'
  }
  if (diff < 11 * day) {
    return ~~ (diff/day) + 'd'
  }
  if (diff < year) {
    return MMDD(new Date(date))
  }
  else {
    return YYMMDD(new Date(date))
  }
}

export default dateStringify
