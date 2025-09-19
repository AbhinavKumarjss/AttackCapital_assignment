const express = require('express');
const CallLog = require('../model/CallLogSchema'); 
const router = express.Router();

////////////////////////////////////////////////////////////
//      GET CALL LOGS FROM MONGO DB
////////////////////////////////////////////////////////////
router.get('/calls', async (req, res) => {
  try {
    const { limit = 100, skip = 0, isSuccessful, direction } = req.query;

    const filter = {};
    if (isSuccessful !== undefined) {
      filter.isSuccessful = isSuccessful === 'true';
    }
    if (direction) {
      filter.direction = direction;
    }
    const callLogs = await CallLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean(); 
    
    const total = await CallLog.countDocuments(filter);

    const transformedCalls = callLogs.map(call => ({
      call_id: call.sessionId, 
      call_type: call.callType,
      from_number: call.fromPhoneNumber,
      to_number: call.toPhoneNumber,
      direction: call.direction,
      call_status: call.disconnectionReason === 'user_ended_call' || call.disconnectionReason === 'agent_ended_call' ? 'ended' : 'failed',
      start_timestamp: new Date(call.createdAt).getTime(), 
      end_timestamp: new Date(call.endedAt).getTime(),
      duration_ms: call.duration || 0,
      transcript: call.transcript || [],
      call_analysis: {
        summary: call.summary,
        is_successful: call.isSuccessful,
        success_evaluation: call.isSuccessful,
        extracted_data: call.custom_function_call_results || []
      },
      dynamic_variables: call.dynamicVariables || {}
    }));
    
    res.json({
      calls: transformedCalls,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ 
      error: 'Error fetching call logs',
      message: error.message 
    });
  }
});

module.exports = router;