<?php

if (!function_exists('getSelectedBranch')) {
    function getSelectedBranch($request)
    {
        return auth()->user()->user_type === "Admin"
            ? $request->header('Selectedbranch')
            : auth()->user()->branch_id;
    }
}
