"use client"

import * as React from "react"
import { Moon, Sun, Heart, Gamepad2 } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 [.proudshe_&]:-rotate-90 [.proudshe_&]:scale-0 [.retrogamer_&]:-rotate-90 [.retrogamer_&]:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Heart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all [.proudshe_&]:rotate-0 [.proudshe_&]:scale-100" />
          <Gamepad2 className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all [.retrogamer_&]:rotate-0 [.retrogamer_&]:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("proudshe")}>
          Proudshe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("retrogamer")}>
          Retro Gamer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
