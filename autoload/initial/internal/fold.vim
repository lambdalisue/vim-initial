function! initial#internal#fold#list() abort
  let l:folds = []
  let l:lnum = 1
  let l:lmax = line('$')
  while l:lnum <= l:lmax
    if foldclosed(l:lnum) isnot# -1
      let l:foldclosedend = foldclosedend(l:lnum)
      let l:foldtextresult = foldtextresult(l:lnum)
      call add(l:folds, [l:lnum, l:foldclosedend, l:foldtextresult])
      let l:lnum = l:foldclosedend + 1
    else
      let l:lnum += 1
    endif
  endwhile
  return l:folds
endfunction
