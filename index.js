const express = require('express');

const app = express();

const port = process.env.PORT || 4041 ;

app.get('/', (_,res) => {
    res.send('Your Express App');
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});