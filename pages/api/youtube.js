import createVideo from './createVideo'

export default (req, res) => {
 switch (req.method) {
   case 'GET':
     try {
      createVideo(req.query.data)
       res.status(200).json({cv : req.query.data})
     } catch (error) {
      console.log(error)
     }
     break;
     case 'POST':
      try {
        
      } catch (error) {
        console.log(error)
      }
      break;
 
   default:
     console.log('NO CONDITION IS MET')
     break;
 }
}
