function! initial#command#Initial#call(args) abort
  let l:length = a:args
        \ ->filter({ _, v -> v =~# '^-length=' })
        \ ->map({ _, v -> str2nr(split(v, '=')[1]) })
        \ ->get(0, 1)
  try
    call denops#request('initial', 'start', [l:length])
  finally
    call initial#internal#popup#closeall()
  endtry
endfunction
