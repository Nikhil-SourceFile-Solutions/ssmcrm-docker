<?php

namespace App\Http\Controllers\Company\Helper;

// class NumberToWords
// {
//     public static function convert($number)
//     {
//         $formatter = new \NumberFormatter('en', \NumberFormatter::SPELLOUT);
//         return ucfirst($formatter->format($number));
//     }
// }

// app/Http/Controllers/Company/Helper/NumberToWords.php

use NumberToWords\NumberToWords;

if (!function_exists('numberToWords')) {
    function numberToWords($number)
    {
        return 1234;
        // $numberToWords = new NumberToWords();
        // $numberTransformer = $numberToWords->getNumberTransformer('en'); // 'en' for English
        // return $numberTransformer->toWords($number);
    }
}

