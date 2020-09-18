import * as functions from 'firebase-functions';
const helper = require("./common/helper");
import { setHeaders } from './auth/onRequest';
import { db } from "./admin/admin";
const jwt = require("jsonwebtoken")
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


export const getAllUserForParticularEmail = functions.https.onRequest(async (request, response) => {
  const result:any = {}   
  try {
    const studentArray : any = []
    const snapshot = await db.collection('userCollection').get()
    for (const studentDocs of snapshot.docs){
      studentArray.push(studentDocs.data())
    }
    result['success'] = studentArray

  } catch (error) {
    result['error'] = error
  }
  response.send(result);
});


export const login = functions.https.onRequest(async (request, response) => {
  const result:any = {}   
  try {
    const email: any = request.query.email
    if (email=== undefined){
      throw new Error("Email cannot be null")      
    }
    const snapshot = await db.collection('userCollection').doc(email).get()
    if(!snapshot.exists){
      throw new Error("Email not exist")
    }
    if(snapshot.data()!.password === request.query.password) {
      await jwt.verify(snapshot.data()!.token,  "secretkey", async (err: any, data: any) => {
        console.log("data", data)
        if (err === undefined){
          result['error'] = "auth failed"
        } else {
          result['success'] = "login successfull"
        }
      } )
    } else {
      result['error'] = "login failed"
    }
  } catch (error) {
    result['error'] = error
  }
  response.send(result);
});


export const signup = functions.https.onRequest(async (request, response) => {
  const result:any = {}   
  try {
    const email: any = request.query.email
    const password: any = request.query.password
    if (email === undefined || password === undefined) {
      throw new Error("email or password cannot be null")      
    }
    const snapshot = await db.collection('userCollection').doc(email).get()
    if(snapshot.exists){
      throw new Error("Email already exist")
    }
     await jwt.sign({user: email}, "secretkey", async (err: any, token: any) => {
       console.log(token)
        await db.collection('userCollection').doc(email).set({email: email, password: password, image: request.query.image, name: request.query.name, token: token})
      })
    result['success'] = "signup successfull"

  } catch (error) {
    result['error'] = error
  }
  response.send(result);
});


