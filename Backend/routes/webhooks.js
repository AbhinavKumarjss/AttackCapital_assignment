const express = require('express');
const { PatientData, Patients } = require('../Mockdata');
const CallLog = require('../model/CallLogSchema');
const { cleanTranscript } = require('../utils');

const router = express.Router();

let patientData = Patients[1];
let custom_function_call_results = [];

/////////////////////////////////////////////////////////
// POST PreCall Webhook Implementation
// OpenMic calls this before a conversation starts
/////////////////////////////////////////////////////////

router.post("/precall", async (req, res) => {
  try {

    custom_function_call_results = [];
    
    // Prepare patient data with available medical IDs
    DynamicVariables = {
      ...patientData,
      available_medical_ids: Object.keys(PatientData)
    };

    res.status(200).json({
      call: {
        dynamic_variables: DynamicVariables
      }
    });
  } catch (error) {
    console.error('Error in precall webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error in precall webhook',
      message: error.message 
    });
  }
});

////////////////////////////////////////////////////
// POST PostCall Webhook Implementation
// OpenMic calls this after conversation ends
////////////////////////////////////////////////////

router.post('/postcall', async (req, res) => {
  try {
    console.log('PostCall webhook received:', JSON.stringify(req.body, null, 2));
    
    // Extract all fields from the webhook payload according to OpenMic documentation
    const {type = 'end-of-call-report',sessionId,callType,direction,toPhoneNumber,fromPhoneNumber,createdAt,endedAt,disconnectionReason,isSuccessful = false,summary,transcript = [],dynamicVariables = {}} = req.body || {};

    // remove empty messages
    cleanTranscript(transcript);

    console.log('Received transcript:', JSON.stringify(transcript, null, 2));

    const callLogData = {
        type,
        sessionId,
        callType: callType || 'phonecall',
        direction: direction || 'outbound',
        toPhoneNumber: toPhoneNumber || 'unknown',
        fromPhoneNumber: fromPhoneNumber || 'unknown',
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        disconnectionReason: disconnectionReason || 'unknown',
        isSuccessful,
        summary,
        transcript: cleanedTranscript, 
        dynamicVariables,
        custom_function_call_results: [...custom_function_call_results]
      };

    const newRecord = await CallLog.create(callLogData);

    if (isSuccessful) {
      // Update patient's appointment request status if call was successful
      Patients[1].request_next_apointment = true;
      console.log('Updated patient appointment request status');
    }

    custom_function_call_results = [];

    res.status(200).json({ 
      status: 'received', 
      callId: newRecord._id.toString(),
      sessionId: sessionId,
      saved: true
    });

  } catch (error) {
    res.status(200).json({ 
      status: 'received', 
      error: 'Database save failed',
      message: error.message,
      sessionId: req.body?.sessionId 
    });
  }
});

////////////////////////////////////////////////////////////////////////////////////
// POST Custom Function Implementation
// Optional: in-call function call API for agent to fetch data during conversation
// Body: { medical_id }
////////////////////////////////////////////////////////////////////////////////////

router.post('/get-details', (req, res) => {
    const { medical_id } = req.body || {};
    // Using Mock Patient data
    const result = PatientData[medical_id];
    // Store the result for later inclusion in post-call webhook
    custom_function_call_results.push({
      medical_id,
      timestamp: new Date().toISOString(),
      data: result
    });
    res.status(200).json(result);
});



module.exports = router;