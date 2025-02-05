"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Settings } from "lucide-react"
import { useLeaderboardState } from "./leaderboard-state"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { DropdownThemeToggle } from "./ui/dropdown-theme-toggle"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Switch } from "./ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export function LeaderboardSettings() {
  const {
    useMetric,
    setUseMetric,
    numberFormat,
    setNumberFormat,
    autoOpen,
    setAutoOpen,
  } = useLeaderboardState()

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Settings & Info">
              <Settings />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>
          <VisuallyHidden>
            <DialogTitle>Settings & Info</DialogTitle>
          </VisuallyHidden>
          <p>Settings & Info</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent
        className="max-w-md gap-2 p-2"
        hideClose
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <div className="grid grid-cols-5 gap-4 p-4">
              <div className="col-span-2 mr-2 text-right">
                <Label
                  htmlFor="distance-units"
                  className="text-muted-foreground"
                >
                  Distance Units
                </Label>
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <Label
                  htmlFor="distance-units"
                  onClick={() => setUseMetric(true)}
                  className="text-right"
                >
                  Imperial (mi)
                </Label>
                <Switch
                  id="distance-units"
                  checked={useMetric}
                  onCheckedChange={setUseMetric}
                  className="data-[state=checked]:bg-zinc-300 data-[state=unchecked]:bg-zinc-300"
                />
                <Label
                  htmlFor="distance-units"
                  onClick={() => setUseMetric(false)}
                >
                  Metric (km)
                </Label>
              </div>
              <div className="col-span-2 mr-2 text-right">
                <Label
                  htmlFor="number-format"
                  className="align-middle text-muted-foreground"
                >
                  Number Format
                </Label>
              </div>
              <Select value={numberFormat} onValueChange={setNumberFormat}>
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder={`1,234.56 ${useMetric ? "km" : "mi"}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">
                    1,234.56 {useMetric ? "km" : "mi"}
                  </SelectItem>
                  <SelectItem value="de-DE">
                    1.234,56 {useMetric ? "km" : "mi"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2 mr-2 text-right">
                <Label
                  htmlFor="auto-open"
                  className="align-middle text-muted-foreground"
                >
                  Auto-open first leaderboard
                </Label>
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="auto-open"
                  checked={autoOpen}
                  onCheckedChange={setAutoOpen}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="col-span-2 mr-2 text-right">
                <Label className="align-middle text-muted-foreground">
                  Light/Dark Mode
                </Label>
              </div>
              <div className="col-span-3 flex items-start space-x-2">
                <DropdownThemeToggle />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="info">
            <div className="p-4">
              <p>
                Ride leaderboards are delayed by one day to allow more people to
                participate. They include all riders in the tag that did the
                ride from 12 hours before NL until the start of NL's stream the
                following day.
              </p>
              <p className="mt-4">
                Don't want to be on the leaderboard? Setting your Peloton
                profile to private, or blocking Lionbot, will hide you from
                future leaderboards.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="items-center justify-center">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
