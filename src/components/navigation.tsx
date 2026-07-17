"use client"

import { usePathname } from "next/navigation"
import type React from "react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu"
import { cn } from "@lib/utils"

export function Navigation(): React.ReactElement {
  const pathname = usePathname()

  const getLinkClasses = (href: string): string => {
    const isActive =
      pathname === href ||
      (href === "/latest" && pathname.startsWith("/archive/")) ||
      (href === "/cyclists" && pathname.startsWith("/cyclist/"))
    return cn(
      navigationMenuTriggerStyle(),
      "hover:bg-transparent hover:shadow-lg hover:shadow-primary/70",
      isActive && "shadow-md shadow-primary/50",
    )
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.currentTarget.blur()
  }

  return (
    <div className="flex max-w-full items-center justify-center">
      <NavigationMenu className="m-1 rounded-lg md:mt-4">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/latest"
              className={getLinkClasses("/latest")}
              onClick={handleClick}
            >
              Leaderboards
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/cyclists"
              className={getLinkClasses("/cyclists")}
              onClick={handleClick}
            >
              Cyclists
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                getLinkClasses("/daily-game"),
                "pointer-events-none opacity-50 shadow-none hover:bg-background hover:text-foreground",
              )}
            >
              Daily Game
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
