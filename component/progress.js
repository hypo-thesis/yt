import { motion } from "framer-motion";
import React from 'react'



const Progress = ({ progressP }) => {

    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        setWidth((progressP * 500) / 100)
    }, [progressP]);


    return (
        <div className='progressContainer'>
            {typeof progressP === 'number' && <motion.div className='progress' animate={{ width }}> {progressP}% </motion.div>}
        </div>
    );
}


export default Progress
