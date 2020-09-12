import * as functions from 'firebase-functions';
const helper = require("./common/helper");
import { setHeaders } from './auth/onRequest';

export const demoSlotData = functions.https.onRequest(async (request, response) => {
    await setHeaders(request, response)

	 const result:any = {}    
    try {
        const options = {
            "method": "GET",
            "hostname":"script.googleusercontent.com",
            "path": "/macros/echo?user_content_key=y5DqCFPE_-DOnIaYbfXwEZRY5YbCi_o8HLP4oSnj86Br6D1S09FlnICTKTAqsrxi90uLNEDY4DIhb0fjXcJm3Gqp_wL3PYxJm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnC09Nb0QZ6ca_LU0vmo6mSiQ7SyFG3CgdL9-1Vgcha-TAYaAGhh-9xNG-9rMNEZHQRElvdDletx0&lib=MlJcTt87ug5f_XmzO-tnIbN3yFe7Nfhi6"
          };
          const getOptions: any = {}
          getOptions['options'] = options
          const data = await helper.httpsRequestPromise(getOptions,'GET')
          result['success'] = JSON.parse(data)
    } catch (error) {
        result['error'] = error
    }
 response.send(result);
});
