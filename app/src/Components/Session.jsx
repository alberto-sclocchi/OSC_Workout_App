// current session the user will be working on during their workout, where they will log what exersises and weight they are perorming

import React from 'react'
import Timer from './Timer'
// import costume alert sound for the timer
import alertSound from '../Audio/alarm_audio.wav'

export default function Session() {
  return (
    <div>
        <h1>Session</h1>
        <Timer alertSound={alertSound} />
    </div>
  )
}
