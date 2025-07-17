import React, { useEffect, useState } from 'react'
import Card from './Card'
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

export default function Index() {

  return (
    <div>
<Card />
    </div>
  )
}
