// pages/report.js — pure server-side redirect, zero client render
const PIN_META = {"110002":"ITO","110003":"Lodhi Road","110005":"Karol Bagh","110006":"Chandni Chowk","110007":"Delhi University","110008":"Shadipur","110009":"Model Town","110010":"Cantonment","110012":"Pusa","110016":"Hauz Khas","110017":"Saket","110018":"Vikaspuri","110019":"Dwarka Sec 6","110020":"Okhla","110021":"Moti Bagh","110022":"R.K. Puram","110024":"Lajpat Nagar","110025":"Mathura Road","110026":"Punjabi Bagh","110032":"Anand Vihar","110033":"Jahangirpuri","110034":"Pitampura","110036":"Alipur","110037":"Aerocity","110039":"Bawana","110040":"Narela","110041":"Mundka","110042":"DTU","110043":"Najafgarh","110044":"Tughlakabad","110049":"Sirifort","110052":"Ashok Vihar","110053":"Maujpur","110058":"Janakpuri","110063":"Paschim Vihar","110065":"Nehru Nagar","110067":"JNU Area","110068":"Maidan Garhi","110070":"Vasant Kunj","110073":"Jaffarpur","110077":"Dwarka Sec 8","110078":"Dwarka","110084":"Burari","110085":"Rohini","110091":"Mayur Vihar","110092":"Patparganj","110094":"Sonia Vihar","110095":"Vivek Vihar","121001":"Faridabad","121002":"Faridabad NIT","122001":"Gurugram","122002":"Cyber City","122003":"Gurugram Sec 55","122051":"Manesar","122107":"Nuh","122413":"Panchgaon","123106":"Dharuhera","124001":"Rohtak","124507":"Bahadurgarh","125050":"Fatehabad","125055":"Sirsa","131001":"Sonipat","132103":"Panipat","135001":"Yamuna Nagar","201001":"Ghaziabad","201301":"Noida Sec 1","201304":"Noida Sec 137","201309":"Noida Sec 62","122505":"Mahendragarh","122502":"Rewari","122108":"Taoru","122101":"Sohna","122103":"Gurgaon South","123001":"Jhajjar","123401":"Rewari Town","131029":"Kundli","131027":"Murthal","201102":"Loni","201014":"Indirapuram","201012":"Vasundhara","201016":"Crossing Republik","201002":"Raj Nagar","201010":"Kaushambi","201206":"Muradnagar","245101":"Hapur","203001":"Bulandshahr"}

export async function getServerSideProps({ query }) {
  const { pin, q } = query
  if (pin && /^\d{6}$/.test(pin))
    return { redirect: { destination: `/report/${pin}`, permanent: false } }
  if (q) {
    const s = q.trim().toLowerCase()
    const match = Object.entries(PIN_META).find(([, name]) => name.toLowerCase().includes(s))
    if (match) return { redirect: { destination: `/report/${match[0]}`, permanent: false } }
  }
  return { redirect: { destination: '/', permanent: false } }
}

export default function Report() { return null }
