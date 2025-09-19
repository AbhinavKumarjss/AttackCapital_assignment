const mongoose = require('mongoose');

const CallLogsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    default: 'end-of-call-report',
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true 

  },
  callType: { 
    type: String, 
    default: 'phonecall' 
  },
  direction: { 
    type: String, 
    enum: ['inbound', 'outbound'],
    default: 'outbound'
  },
  toPhoneNumber: { 
    type: String, 
    default: 'unknown'
  },
  fromPhoneNumber: { 
    type: String, 
    default: 'unknown'
  },

  createdAt: { 
    type: Date, 
    default: Date.now
  },
  endedAt: { 
    type: Date, 
    default: Date.now
  },

  disconnectionReason: { 
    type: String, 
    default: 'unknown'
  },
  isSuccessful: { 
    type: Boolean, 
    default: false 
  },
  summary: { 
    type: String, 
    required: true 
  },
  
   transcript: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  
  dynamicVariables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  custom_function_call_results: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },

  duration: {
    type: Number, 
    default: 0
  }
}, { 
  timestamps: true
});

CallLogsSchema.pre('save', function(next) {
  if (this.endedAt && this.createdAt) {
    this.duration = new Date(this.endedAt).getTime() - new Date(this.createdAt).getTime();
  }
  next();
});


CallLogsSchema.index({ sessionId: 1 }); 
CallLogsSchema.index({ createdAt: -1 });
CallLogsSchema.index({ isSuccessful: 1 });
CallLogsSchema.index({ direction: 1 }); 

const CallLog = mongoose.model("CallLog", CallLogsSchema);

module.exports = CallLog;