// Script for 

const util = require('util')
const axios = require('axios')
const { Parser } = require('xml2js')

// Axios settings
axios.defaults.headers.post['Content-Type'] = 'text/xml;charset=UTF-8'
axios.defaults.baseURL = `https://www.drv.gov.ua/ords/svc/personal/API/Opendata`

// Data Settings
const baseSOAP = [`<soap:Envelope xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:drv=\"http://www.drv.gov.ua/\"><soap:Header/><soap:Body>`, `</soap:Body></soap:Envelope>`]
const createSOAP = s => baseSOAP[0] + s + baseSOAP[1]

// XML processor settings

const XMLParser = new Parser({
  async: true,
  trim: true,
  normalize: true,
  explicitArray: false,
  tagNameProcessors: [s => s.replace(/^.*?:/, '')]
})
XMLParser.parseString = util.promisify(XMLParser.parseString)

// Відомості про органи ведення Державного реєстру виборців
const getOrgans = async () => {
  try {
    const command = `<drv:GetOrgansService />`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.OrgansList
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Довідник "Регіони України"
const getRegions = async () => {
  try {
    const command = `<drv:GetRegionsService />`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.RegionsList
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Відомості про виборчі округи, утворені Комісією на постійній основі, у тому числі адреси місцезнаходження окружних виборчих комісій та опис меж виборчих округів
const getAreas = async () => {
  try {
    const command = `<drv:GetAreas />`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.AreasList
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Відомості про виборчі дільниці, утворені на постійній основі, у тому числі адреси місцезнаходження дільничних виборчих комісій та приміщень для голосування
const getPollingStations = async (areaID) => {
  if (typeof areaID === 'undefined') return 'Area is not set'
  if (!(areaID + '').match(/^\d+$/)) return 'Area ID must be numeric'
  try {
    const command = `
      <drv:GetPollingStations>
        <drv:PSParams>
          <drv:Area>${areaID}</drv:Area>
        </drv:PSParams>
      </drv:GetPollingStations>`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.PSList
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Відомості про адміністративно-територіальні одиниці
const getATO = async (regionID) => {
  if (typeof regionID === 'undefined') return 'Region is not set'
  if (!(regionID + '').match(/^\d+$/)) return 'Region ID must be numeric'
  try {
    const command = `
      <drv:GetATO>
        <drv:ATOParams>
          <drv:Reg_ID>${regionID}</drv:Reg_ID>
        </drv:ATOParams>
      </drv:GetATO>`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.ATOList
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Довідник "Адресний реєстр"
const getAdrReg = async (ATOID) => {
  if (typeof ATOID === 'undefined') return 'ATO is not set'
  if (!(ATOID + '').match(/^\d+$/)) return 'ATO ID must be numeric'
  try {
    const command = `
      <drv:GetAdrReg>
        <drv:AdrRegParams>
          <drv:ATO_ID>${ATOID}</drv:ATO_ID>
        </drv:AdrRegParams>
      </drv:GetAdrReg>`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.GEONIMS.GEONIM[0].BUILDS
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Відомості щодо кількісних характеристик виборчого корпусу у межах Автономної Республіки Крим, областей, районів, міст, районів у містах, селищ і сіл, у закордонному виборчому окрузі
const getCntVotATO = async (monthNum) => {
  if (typeof monthNum === 'undefined') return 'monthNum is not set'
  if (!(monthNum + '').match(/^\d+$/)) return 'monthNum ID must be numeric'
  try {
    const command = `
      <drv:GetCntVotATO>
        <drv:GetCntVotATOParams>
          <drv:MONTHNUM>${monthNum}</drv:MONTHNUM>
        </drv:GetCntVotATOParams>
      </drv:GetCntVotATO>`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.List
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

// Відомості щодо кількісних характеристик виборчого корпусу у межах Автономної Республіки Крим, областей, районів, міст, районів у містах, селищ і сіл, у закордонному виборчому окрузі
const getCntVotPS = async (monthNum) => {
  if (typeof monthNum === 'undefined') return 'monthNum is not set'
  if (!(monthNum + '').match(/^\d+$/)) return 'monthNum ID must be numeric'
  try {
    const command = `
      <drv:GetCntVotPS>
        <drv:GetCntVotPSParams>
          <drv:MONTHNUM>${monthNum}</drv:MONTHNUM>
        </drv:GetCntVotPSParams>
      </drv:GetCntVotPS>`
    const response = await axios.post('', createSOAP(command))
    const result = await XMLParser.parseString(response.data)
    try {
      return result.Envelope.Body.ListPS
    } catch (err) {
      return console.log('XML is mailformed')
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  getRegions,
  getOrgans,
  getAreas,
  getPollingStations,
  getATO,
  getCntVotATO,
  getAdrReg,
  getCntVotPS  
}

// Usage Example

// GetRegions().then(res => console.log(res))
// GetOrgans().then(res => console.log(res))
// GetAreas().then(res => console.log(res))
// GetPollingStations(12).then(res => console.log(res))
// GetATO(12).then(res => console.log(res))
// GetCntVotATO(12).then(res => console.log(res))
// GetAdrReg(14074).then(res => console.log(res))
// GetCntVotPS(1).then(res => console.log(res))
