function! initial#internal#popup#closeall() abort
  let l:winids = range(1, winnr('$'))
        \ ->map({_, v -> win_getid(v)})
        \ ->filter({_, v -> win_gettype(v) ==# 'popup'})
        \ ->filter({_, v -> getwinvar(v, '&filetype') ==# 'initial-overlay'})
  call foreach(l:winids, {_, v -> s:close(v)})
endfunction

if has('nvim')
  function! s:close(winid) abort
    call nvim_win_close(a:winid, v:true)
  endfunction
else
  function! s:close(winid) abort
    call popup_close(a:winid)
  endfunction
endif
