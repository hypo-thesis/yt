// import Head from 'next/head'
import Progress from '../component/progress'
import styles from '../styles/Home.module.css'
import { useRef } from 'react'
import axios from 'axios'
import W3CWebSocket from 'websocket'
import { motion, AnimatePresence } from "framer-motion"
const WebSocket = W3CWebSocket.w3cwebsocket




export default function Home() {

  const myRef = useRef('')
  const [progressP, setProgressP] = React.useState(0)
  const [state, setState] = React.useState(0);
  const [fileName, setFileName] = React.useState('');



  const handleEnter = async (e) => {
    if (e.key === 'Enter') {
      const resp = await axios.get('http://localhost:3000/api/youtube', {
        params: { data: myRef.current.value }
      })
      console.log(resp)
      const ws = new WebSocket('ws://localhost:8082')
      ws.addEventListener('open', () => {
        console.log('client is connected')
      })
      ws.addEventListener('close', () => {
        console.log('client is disconnected !!!')
      })
      ws.addEventListener('message', (msg) => {

        try {
          const res = JSON.parse(msg.data)
          console.log(res)
          if (typeof res.percentage === 'string') setProgressP(+res.percentage)
          setFileName(res.fileName)
          res.status === 'done' && setState(2)
        } catch (error) {
          console.log(error)
        }

      })
      setState(1)
    }
  }




  return (
    <AnimatePresence>
      <div className={styles.container}>
        {state === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}> <input ref={myRef} onKeyDown={handleEnter} placeholder='Youtube URL' defaultValue='https://www.youtube.com/watch?v=m4wllxpGKew' /> </motion.div>}
        {state === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}> <Progress progressP={+progressP} /> </motion.div>}
        {state === 2 && <div> <a href={`./dl/${fileName}.mp4`}>Download</a> </div>}

      </div>
    </AnimatePresence>
  )
}
