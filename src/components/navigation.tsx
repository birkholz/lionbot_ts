"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu"
import { cn } from "@lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const getLinkClasses = (href: string) => {
    const isActive =
      pathname === href ||
      (href === "/latest" && pathname.startsWith("/archive/"))
    return cn(
      navigationMenuTriggerStyle(),
      "bg-zinc-900 hover:bg-zinc-900 hover:shadow-lg hover:shadow-primary/70",
      isActive && "shadow-md shadow-primary/50",
    )
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.blur()
  }

  return (
    <div className="mb-2 flex max-w-full items-center justify-center">
      <NavigationMenu className="my-4 rounded-lg">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/latest" legacyBehavior passHref>
              <NavigationMenuLink
                className={getLinkClasses("/latest")}
                onClick={handleClick}
              >
                Leaderboards
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/users" legacyBehavior passHref>
              <NavigationMenuLink
                className={getLinkClasses("/users")}
                onClick={handleClick}
              >
                Users
              </NavigationMenuLink>
            </Link>
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
