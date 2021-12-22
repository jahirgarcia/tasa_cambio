const { post } = require('axios');
const { js2xml } = require('xml-js');
const XML = require('fast-xml-parser');

const serviceDomain = 'servicios.bcn.gob.ni';
const servicePath = '/Tc_Servicio/ServicioTC.asmx';

const getRequestBody = (year, month) => ({
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'utf-8'
    }
  },
  elements: [
    {
      type: 'element',
      name: 'soap:Envelope',
      attributes: {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/'
      },
      elements: [
        {
          type: 'element',
          name: 'soap:Body',
          elements: [
            {
              type: 'element',
              name: 'RecuperaTC_Mes',
              attributes: {
                xmlns: `http://${ serviceDomain }/`
              },
              elements: [
                {
                  type: 'element',
                  name: 'Ano',
                  elements: [{ type: 'text', text: year }]
                },
                {
                  type: 'element',
                  name: 'Mes',
                  elements: [{ type: 'text', text: month }]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

const transformResponse = data => XML.parse(data, { ignoreNameSpace: true }).Envelope.Body
  .RecuperaTC_MesResponse.RecuperaTC_MesResult.Detalle_TC.Tc
  .map(tasa => ({
    date: tasa.Fecha,
    currency: tasa.Valor,
    year: tasa.Ano,
    month: tasa.Mes,
    day: tasa.Dia
  }))
  .sort((a, b) => a.day - b.day);

const options = {
  headers: {
    'Content-Type': 'text/xml'
  },
  transformResponse
}

module.exports = async (year, month) => post(
  `https://${ serviceDomain }${servicePath}`,
  js2xml(getRequestBody(year, month)),
  options
);
