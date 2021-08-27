const express = require('express');
import {test} from './utils';

const app = express();

const port = process.env.PORT || 4042 ;

app.get('/', (_:any,res:any) => {
    res.send('Your Express App');
});

app.listen(port, () => {
    test();
    console.log(`Server is running on port: ${port}`)
});