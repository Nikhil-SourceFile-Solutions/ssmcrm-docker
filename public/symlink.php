<?php
$from = "/home/thefinsap/public_html/sfs-saas-crm/public/storage";
$to = "/home/thefinsap/public_html/storage";
symlink($from, $to);
echo readlink($to);
?>