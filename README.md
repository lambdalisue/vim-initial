# 🅰️ Initial

[![Test](https://github.com/lambdalisue/vim-initial/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/vim-initial/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/lambdalisue/vim-initial/graph/badge.svg?token=0WzxKNH22o)](https://codecov.io/gh/lambdalisue/vim-initial)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![CleanShot 2024-11-20 at 21 40 49](https://github.com/user-attachments/assets/f3a4dfeb-7309-4ced-9608-a5ad41b4d6bb)

**Initial** (_vim-initial_) is yet another jump-assistant plugin for Vim/Neovim
powered by [Denops].

This plugin restricts matching targets to **the initial characters** of words,
reducing the number of candidates for filtering. The design is based on the
hypothesis that when users want to jump to a specific location on the screen,
they often focus on the initial characters of words. Thanks to this approach,
after triggering the plugin, users can jump to their desired location by typing
an average of 2–3 keys (excluding the key used to invoke the plugin).

> [!WARNING]
> This plugin is still in the early stages of development. Its practicality and
> value for users are yet to be determined, and future maintenance depends on
> its reception.

[Denops]: https://github.com/vim-denops/denops.vim

## Requirements

Users must have [Deno] installed to use this plugin.

[Deno]: https://deno.land

## Installation

To install [Denops] and this plugin using a plugin manager such as [vim-plug],
add the following lines to your Vim configuration:

```vim
Plug 'vim-denops/denops.vim'
Plug 'lambdalisue/vim-initial'
```

[vim-plug]: https://github.com/junegunn/vim-plug

## Usage

First, define a normal mode mapping to invoke the `Initial` command, for
example:

```vim
nnoremap t <Cmd>Initial<CR>
```

Then, type `t` to invoke the `Initial` command.

When the `Initial` command is invoked, the plugin enters the **Initial Character
Input Mode**. In this mode, users type the initial character of the desired
word, transitioning to the **Label Jump Mode**. In **Label Jump Mode**, labels
are assigned to words whose initial character matches the input. Typing the
label will jump to the target location.

If the target count is zero or one during the **Initial Character Input Mode**,
the plugin will automatically cancel or jump without transitioning to the
**Label Jump Mode**.

To modify the number of initial characters to match, use the `-length={number}`
argument with the `Initial` command. For example:

```vim
nnoremap t <Cmd>Initial -length=3<CR>
```

## Acknowledgments

This plugin is heavily inspired by [fuzzy-motion.vim]. While **Initial** imposes
stricter constraints, such as limiting matches to word initials, many usability
ideas are derived from fuzzy-motion.vim.

[fuzzy-motion.vim]: https://github.com/yuki-yano/fuzzy-motion.vim

## License

The code in this repository is licensed under the MIT License, as described in
[LICENSE](./LICENSE). Contributors agree that any modifications submitted to
this repository are also licensed under the same terms.
