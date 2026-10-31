// Real fma-ds components rendered under the theme being edited.

import {
  Bell,
  Bold,
  CircleAlert,
  CircleCheck,
  Info,
  Italic,
  MoreHorizontal,
  Sparkles,
  TriangleAlert,
  Underline,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/accordion/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/core/alert/alert";
import { Avatar, AvatarFallback, AvatarGroup } from "@/core/avatar/avatar";
import { Badge, badgeVariantsConfig } from "@/core/badge/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/core/breadcrumb/breadcrumb";
import { Button } from "@/core/button/button";
import { Calendar } from "@/core/calendar/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/card/card";
import { Checkbox } from "@/core/checkbox/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/core/command/command";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/dialog/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/core/dropdown-menu/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/core/field/field";
import { Input } from "@/core/input/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/core/input-otp/input-otp";
import { Kbd } from "@/core/kbd/kbd";
import { Label } from "@/core/label/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/core/pagination/pagination";
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/core/popover/popover";
import { Progress, ProgressLabel, ProgressValue } from "@/core/progress/progress";
import { RadioGroup, RadioGroupItem } from "@/core/radio-group/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/select/select";
import { Separator } from "@/core/separator/separator";
import { Skeleton } from "@/core/skeleton/skeleton";
import { Slider } from "@/core/slider/slider";
import { Spinner } from "@/core/spinner/spinner";
import { Switch } from "@/core/switch/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/table/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import { Textarea } from "@/core/textarea/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/core/toggle-group/toggle-group";
import { Tooltip, TooltipTrigger } from "@/core/tooltip/tooltip";
import {
  brandGlow,
  brandGradient,
  brandGradientBorder,
  brandSpinningBorder,
  brandSurface,
} from "@/lib/brand";
import { SHADOW_SIZES } from "@/lib/theme/index";
import { cn } from "@/lib/utils";

const PAYMENTS = [
  { id: "INV-001", customer: "Ana Souza", amount: "R$ 250,00", status: "Paid" },
  { id: "INV-002", customer: "Bruno Lima", amount: "R$ 150,00", status: "Pending" },
  { id: "INV-003", customer: "Carla Dias", amount: "R$ 350,00", status: "Failed" },
  { id: "INV-004", customer: "Diego Alves", amount: "R$ 450,00", status: "Paid" },
] as const;

const STATUS_BADGE = {
  Paid: "success-light",
  Pending: "warning-light",
  Failed: "destructive-light",
} as const;

const CHART = [62, 88, 45, 74, 96, 58, 80];

type BadgeVariant = keyof typeof badgeVariantsConfig.variant;

// Every badge variant, read from the component so a new one shows up here on its own.
const BADGE_VARIANTS = Object.keys(badgeVariantsConfig.variant) as BadgeVariant[];

const BADGE_GROUPS = [
  { label: "Light", suffix: "-light" },
  { label: "Outline", suffix: "-outline" },
  { label: "Dot", suffix: "-dot" },
] as const;

const BADGE_ROWS = [
  {
    label: "Solid",
    variants: BADGE_VARIANTS.filter((variant) =>
      BADGE_GROUPS.every(({ suffix }) => !variant.endsWith(suffix)),
    ),
  },
  ...BADGE_GROUPS.map(({ label, suffix }) => ({
    label,
    variants: BADGE_VARIANTS.filter((variant) => variant.endsWith(suffix)),
  })),
];

function AccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your email below to create your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="showcase-email">Email</FieldLabel>
          <Input id="showcase-email" type="email" placeholder="you@example.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="showcase-password">Password</FieldLabel>
          <Input id="showcase-password" type="password" defaultValue="hunter2" />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
        <div className="flex items-center gap-2">
          <Checkbox id="showcase-remember" defaultSelected />
          <Label htmlFor="showcase-remember">Remember me</Label>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">Create account</Button>
        <Button variant="outline" className="flex-1">
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}

function SettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what we tell you about.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {["Product updates", "Security alerts", "Weekly digest"].map((label, index) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-sm">{label}</span>
            <Switch aria-label={label} defaultSelected={index < 2} />
          </div>
        ))}
        <Separator />
        <RadioGroup aria-label="Frequency" defaultValue="daily" className="flex gap-4">
          {["instant", "daily", "weekly"].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`showcase-${value}`} />
              <Label htmlFor={`showcase-${value}`} className="capitalize">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex flex-col gap-2">
          <Label>Volume</Label>
          <Slider aria-label="Volume" defaultValue={60} />
        </div>
        <Select aria-label="Language" defaultSelectedKey="pt">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="pt">Português</SelectItem>
            <SelectItem id="en">English</SelectItem>
            <SelectItem id="es">Español</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function PaymentsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table aria-label="Recent payments">
          <TableHeader>
            <TableHead isRowHeader>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id} id={payment.id}>
                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[payment.status]}>{payment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{payment.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AlertsStack() {
  return (
    <div className="flex flex-col gap-3">
      <Alert>
        <Bell />
        <AlertTitle>New sign-in</AlertTitle>
        <AlertDescription>We noticed a sign-in from a new device.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>A new version is available.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are live.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You've used 92% of your quota.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Check your card details and try again.</AlertDescription>
      </Alert>
      <Alert variant="invert">
        <Sparkles />
        <AlertTitle>Pro tip</AlertTitle>
        <AlertDescription>Press ⌘K to open the command palette.</AlertDescription>
      </Alert>
      <Alert variant="brand">
        <Sparkles />
        <AlertTitle>AI validation</AlertTitle>
        <AlertDescription>Check the order details before you confirm it.</AlertDescription>
      </Alert>
    </div>
  );
}

function ControlsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons & overlays</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <Progress value={64}>
          <ProgressLabel>Uploading</ProgressLabel>
          <ProgressValue />
        </Progress>
        <div className="flex items-center justify-between gap-2">
          <AvatarGroup>
            {["AS", "BL", "CD"].map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <div className="flex gap-1.5">
            <TooltipTrigger>
              <Button variant="outline" size="sm">
                Hover me
              </Button>
              <Tooltip>Tooltips use the popover tokens</Tooltip>
            </TooltipTrigger>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon-sm" aria-label="More">
                <MoreHorizontal />
              </Button>
              <DropdownMenu className="w-48">
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="view">
                  View
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem id="download">Download</DropdownMenuItem>
                <DropdownMenuItem id="delete">Delete</DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
            <PopoverTrigger>
              <Button variant="outline" size="sm">
                Popover
              </Button>
              <Popover>
                <PopoverHeader>
                  <PopoverTitle>Dimensions</PopoverTitle>
                  <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
                </PopoverHeader>
              </Popover>
            </PopoverTrigger>
            <DialogTrigger>
              <Button size="sm">Open dialog</Button>
              <Dialog>
                <DialogHeader>
                  <DialogTitle>Delete order?</DialogTitle>
                  <DialogDescription>This can't be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>Cancel</DialogClose>
                  <DialogClose variant="destructive">Delete</DialogClose>
                </DialogFooter>
              </Dialog>
            </DialogTrigger>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Press <Kbd>⌘</Kbd> <Kbd>Z</Kbd> to undo an edit.
          </p>
          <Button variant="outline" size="sm" isDisabled>
            <Spinner />
            Saving
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart colors</CardTitle>
        <CardDescription>--chart-1 … --chart-5</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-36 items-end gap-2">
          {CHART.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md"
              style={{ height: `${value}%`, background: `var(--chart-${(index % 5) + 1})` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SurfacesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shadows & radius</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {SHADOW_SIZES.map((size) => (
            <div
              key={size}
              className="flex h-14 items-center justify-center rounded-lg border bg-card text-xs text-muted-foreground"
              style={{ boxShadow: `var(--shadow-${size})` }}
            >
              {size}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Every variant, then the sizes and the pill radius.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {BADGE_ROWS.map(({ label, variants }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Sizes & radius</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              Object.keys(badgeVariantsConfig.size) as (keyof typeof badgeVariantsConfig.size)[]
            ).map((size) => (
              <Badge key={size} size={size}>
                {size}
              </Badge>
            ))}
            <Badge radius="full">full</Badge>
            <Badge radius="full" variant="success-light">
              full
            </Badge>
            <Badge radius="full" variant="primary-dot">
              full
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand</CardTitle>
        <CardDescription>
          The second identity color. Same as primary in most themes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className={cn("flex items-center justify-between gap-3 rounded-lg p-4", brandSurface)}>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Create your first order</span>
            <span className="text-sm opacity-80">A brand surface: banners, promos.</span>
          </div>
          <Button variant="outline" size="sm" className="text-foreground">
            Start
          </Button>
        </div>
        <div className={cn("h-2 rounded-full", brandGradient)} />
        <div className={cn("flex flex-col gap-1 rounded-lg p-4", brandGradientBorder)}>
          <span className="text-sm font-medium">Gradient border</span>
          <span className="text-sm text-muted-foreground">For promos and AI features.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className={brandGlow}>Glowing CTA</Button>
          <div className={cn("rounded-md", brandSpinningBorder)}>
            <div className="flex items-center gap-2 rounded-[calc(var(--radius-md)-1px)] bg-card px-3 py-1.5 text-sm">
              <Spinner />
              AI is checking…
            </div>
          </div>
          <Badge variant="brand-light">New</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationCard() {
  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>INV-002</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <CardTitle>Navigation & toggles</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultSelectedKey="overview">
          <TabsList variant="line">
            <TabsTrigger id="overview">Overview</TabsTrigger>
            <TabsTrigger id="activity">Activity</TabsTrigger>
            <TabsTrigger id="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-4">
          <ToggleGroup aria-label="Text formatting" defaultSelectedKeys={["bold"]}>
            <ToggleGroupItem id="bold" aria-label="Toggle bold">
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem id="italic" aria-label="Toggle italic">
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem id="underline" aria-label="Toggle underline">
              <Underline />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            aria-label="Period"
            variant="outline"
            selectionMode="single"
            defaultSelectedKeys={["week"]}
          >
            <ToggleGroupItem id="day">Day</ToggleGroupItem>
            <ToggleGroupItem id="week">Week</ToggleGroupItem>
            <ToggleGroupItem id="month">Month</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}

function CommandCard() {
  return (
    <Command className="h-auto border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList renderEmptyState={() => <CommandEmpty>No results found.</CommandEmpty>}>
        <CommandGroup heading="Suggestions">
          <CommandItem id="calendar">Calendar</CommandItem>
          <CommandItem id="search-emoji">Search Emoji</CommandItem>
          <CommandItem id="calculator" isDisabled>
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem id="profile">
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem id="billing">
            Billing
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FormExtrasCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify and leave a note</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel>One-time code</FieldLabel>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <Field>
          <FieldLabel htmlFor="showcase-note">Note</FieldLabel>
          <Textarea id="showcase-note" placeholder="Anything we should know?" />
        </Field>
        <Accordion defaultExpandedKeys={["refunds"]}>
          <AccordionItem id="refunds">
            <AccordionTrigger>How do refunds work?</AccordionTrigger>
            <AccordionContent>Refunds land on the original card within 5 days.</AccordionContent>
          </AccordionItem>
          <AccordionItem id="cancel">
            <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
            <AccordionContent>Yes, from the billing settings.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function Showcase() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="flex flex-col gap-4">
        <AccountCard />
        <PaymentsCard />
        <BadgesCard />
        <FormExtrasCard />
      </div>
      <div className="flex flex-col gap-4">
        <SettingsCard />
        <AlertsStack />
        <NavigationCard />
        <BrandCard />
        <ChartCard />
      </div>
      <div className="flex flex-col gap-4">
        <Card className="items-center">
          <CardContent>
            <Calendar aria-label="Calendar" />
          </CardContent>
        </Card>
        <ControlsCard />
        <CommandCard />
        <SurfacesCard />
        <Tabs defaultSelectedKey="overview">
          <TabsList>
            <TabsTrigger id="overview">Overview</TabsTrigger>
            <TabsTrigger id="analytics">Analytics</TabsTrigger>
            <TabsTrigger id="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent id="overview" className="text-muted-foreground">
            Tabs use muted for the list and background for the selected tab.
          </TabsContent>
          <TabsContent id="analytics">Analytics</TabsContent>
          <TabsContent id="reports">Reports</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
