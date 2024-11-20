if exists('g:loaded_initial')
  finish
endif
let g:loaded_initial = 1

command! -nargs=* Initial call initial#command#Initial#call([<f-args>])

function! s:style() abort
  highlight default link InitialOverlayNormal Conceal
  highlight default link InitialOverlayLabel IncSearch
  highlight default link InitialOverlayMatch Special
endfunction

augroup initial_plugin
  autocmd!
  autocmd ColorScheme * call s:style()
augroup END

call s:style()
