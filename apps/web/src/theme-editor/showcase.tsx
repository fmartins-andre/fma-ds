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
import { Trans, useTranslation } from "react-i18next";
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
  { label: "light", suffix: "-light" },
  { label: "outline", suffix: "-outline" },
  { label: "dot", suffix: "-dot" },
] as const;

const BADGE_ROWS = [
  {
    label: "solid" as const,
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
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.account.title)}</CardTitle>
        <CardDescription>{t(($) => $.account.description)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="showcase-email">{t(($) => $.account.email)}</FieldLabel>
          <Input id="showcase-email" type="email" placeholder="you@example.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="showcase-password">{t(($) => $.account.password)}</FieldLabel>
          <Input id="showcase-password" type="password" defaultValue="hunter2" />
          <FieldDescription>{t(($) => $.account.passwordHint)}</FieldDescription>
        </Field>
        <div className="flex items-center gap-2">
          <Checkbox id="showcase-remember" defaultSelected />
          <Label htmlFor="showcase-remember">{t(($) => $.account.remember)}</Label>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">{t(($) => $.account.create)}</Button>
        <Button variant="outline" className="flex-1">
          {t(($) => $.account.signIn)}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SettingsCard() {
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.settings.title)}</CardTitle>
        <CardDescription>{t(($) => $.settings.description)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          t(($) => $.settings.updates),
          t(($) => $.settings.security),
          t(($) => $.settings.digest),
        ].map((label, index) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-sm">{label}</span>
            <Switch aria-label={label} defaultSelected={index < 2} />
          </div>
        ))}
        <Separator />
        <RadioGroup
          aria-label={t(($) => $.settings.frequency)}
          defaultValue="daily"
          className="flex gap-4"
        >
          {(["instant", "daily", "weekly"] as const).map((value) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`showcase-${value}`} />
              <Label htmlFor={`showcase-${value}`}>{t(($) => $.settings[value])}</Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex flex-col gap-2">
          <Label>{t(($) => $.settings.volume)}</Label>
          <Slider aria-label={t(($) => $.settings.volume)} defaultValue={60} />
        </div>
        <Select aria-label={t(($) => $.settings.language)} defaultSelectedKey="pt">
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
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.payments.title)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table aria-label={t(($) => $.payments.title)}>
          <TableHeader>
            <TableHead isRowHeader>{t(($) => $.payments.order)}</TableHead>
            <TableHead>{t(($) => $.payments.customer)}</TableHead>
            <TableHead>{t(($) => $.payments.status)}</TableHead>
            <TableHead className="text-right">{t(($) => $.payments.amount)}</TableHead>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id} id={payment.id}>
                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[payment.status]}>
                    {t(($) => $.payments[payment.status])}
                  </Badge>
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
  const { t } = useTranslation("showcase");
  return (
    <div className="flex flex-col gap-3">
      <Alert>
        <Bell />
        <AlertTitle>{t(($) => $.alerts.signInTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.signInText)}</AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>{t(($) => $.alerts.infoTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.infoText)}</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>{t(($) => $.alerts.savedTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.savedText)}</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>{t(($) => $.alerts.storageTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.storageText)}</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>{t(($) => $.alerts.paymentTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.paymentText)}</AlertDescription>
      </Alert>
      <Alert variant="invert">
        <Sparkles />
        <AlertTitle>{t(($) => $.alerts.tipTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.tipText)}</AlertDescription>
      </Alert>
      <Alert variant="brand">
        <Sparkles />
        <AlertTitle>{t(($) => $.alerts.aiTitle)}</AlertTitle>
        <AlertDescription>{t(($) => $.alerts.aiText)}</AlertDescription>
      </Alert>
    </div>
  );
}

function ControlsCard() {
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.controls.title)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button>{t(($) => $.controls.default)}</Button>
          <Button variant="secondary">{t(($) => $.controls.secondary)}</Button>
          <Button variant="outline">{t(($) => $.controls.outline)}</Button>
          <Button variant="ghost">{t(($) => $.controls.ghost)}</Button>
          <Button variant="destructive">{t(($) => $.controls.destructive)}</Button>
          <Button variant="link">{t(($) => $.controls.link)}</Button>
        </div>
        <Progress value={64}>
          <ProgressLabel>{t(($) => $.controls.uploading)}</ProgressLabel>
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
                {t(($) => $.controls.hover)}
              </Button>
              <Tooltip>{t(($) => $.controls.tooltip)}</Tooltip>
            </TooltipTrigger>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon-sm" aria-label={t(($) => $.controls.more)}>
                <MoreHorizontal />
              </Button>
              <DropdownMenu className="w-48">
                <DropdownMenuLabel>{t(($) => $.controls.order)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="view">
                  {t(($) => $.controls.view)}
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem id="download">{t(($) => $.controls.download)}</DropdownMenuItem>
                <DropdownMenuItem id="delete">{t(($) => $.controls.delete)}</DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
            <PopoverTrigger>
              <Button variant="outline" size="sm">
                {t(($) => $.controls.popover)}
              </Button>
              <Popover>
                <PopoverHeader>
                  <PopoverTitle>{t(($) => $.controls.dimensions)}</PopoverTitle>
                  <PopoverDescription>{t(($) => $.controls.dimensionsText)}</PopoverDescription>
                </PopoverHeader>
              </Popover>
            </PopoverTrigger>
            <DialogTrigger>
              <Button size="sm">{t(($) => $.controls.openDialog)}</Button>
              <Dialog>
                <DialogHeader>
                  <DialogTitle>{t(($) => $.controls.deleteOrder)}</DialogTitle>
                  <DialogDescription>{t(($) => $.controls.cannotUndo)}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>{t(($) => $.controls.cancel)}</DialogClose>
                  <DialogClose variant="destructive">{t(($) => $.controls.delete)}</DialogClose>
                </DialogFooter>
              </Dialog>
            </DialogTrigger>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            <Trans t={t} i18nKey={($) => $.controls.press} components={{ kbd: <Kbd /> }} />
          </p>
          <Button variant="outline" size="sm" isDisabled>
            <Spinner />
            {t(($) => $.controls.saving)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard() {
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.chart.title)}</CardTitle>
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
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.surfaces.title)}</CardTitle>
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
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.badges.title)}</CardTitle>
        <CardDescription>{t(($) => $.badges.description)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {BADGE_ROWS.map(({ label, variants }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{t(($) => $.badges[label])}</span>
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
          <span className="text-xs text-muted-foreground">{t(($) => $.badges.sizes)}</span>
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
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.brand.title)}</CardTitle>
        <CardDescription>{t(($) => $.brand.description)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className={cn("flex items-center justify-between gap-3 rounded-lg p-4", brandSurface)}>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{t(($) => $.brand.firstOrder)}</span>
            <span className="text-sm opacity-80">{t(($) => $.brand.surface)}</span>
          </div>
          <Button variant="outline" size="sm" className="text-foreground">
            {t(($) => $.brand.start)}
          </Button>
        </div>
        <div className={cn("h-2 rounded-full", brandGradient)} />
        <div className={cn("flex flex-col gap-1 rounded-lg p-4", brandGradientBorder)}>
          <span className="text-sm font-medium">{t(($) => $.brand.border)}</span>
          <span className="text-sm text-muted-foreground">{t(($) => $.brand.borderText)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className={brandGlow}>{t(($) => $.brand.glow)}</Button>
          <div className={cn("rounded-md", brandSpinningBorder)}>
            <div className="flex items-center gap-2 rounded-[calc(var(--radius-md)-1px)] bg-card px-3 py-1.5 text-sm">
              <Spinner />
              {t(($) => $.brand.checking)}
            </div>
          </div>
          <Badge variant="brand-light">{t(($) => $.brand.new)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationCard() {
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t(($) => $.navigation.home)}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t(($) => $.navigation.orders)}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>INV-002</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <CardTitle>{t(($) => $.navigation.title)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultSelectedKey="overview">
          <TabsList variant="line">
            <TabsTrigger id="overview">{t(($) => $.navigation.overview)}</TabsTrigger>
            <TabsTrigger id="activity">{t(($) => $.navigation.activity)}</TabsTrigger>
            <TabsTrigger id="settings">{t(($) => $.navigation.settings)}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-4">
          <ToggleGroup
            aria-label={t(($) => $.navigation.formatting)}
            defaultSelectedKeys={["bold"]}
          >
            <ToggleGroupItem id="bold" aria-label={t(($) => $.navigation.bold)}>
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem id="italic" aria-label={t(($) => $.navigation.italic)}>
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem id="underline" aria-label={t(($) => $.navigation.underline)}>
              <Underline />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            aria-label={t(($) => $.navigation.period)}
            variant="outline"
            selectionMode="single"
            defaultSelectedKeys={["week"]}
          >
            <ToggleGroupItem id="day">{t(($) => $.navigation.day)}</ToggleGroupItem>
            <ToggleGroupItem id="week">{t(($) => $.navigation.week)}</ToggleGroupItem>
            <ToggleGroupItem id="month">{t(($) => $.navigation.month)}</ToggleGroupItem>
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
  const { t } = useTranslation("showcase");
  return (
    <Command className="h-auto border shadow-md">
      <CommandInput placeholder={t(($) => $.command.placeholder)} />
      <CommandList
        renderEmptyState={() => <CommandEmpty>{t(($) => $.command.empty)}</CommandEmpty>}
      >
        <CommandGroup heading={t(($) => $.command.suggestions)}>
          <CommandItem id="calendar">{t(($) => $.command.calendar)}</CommandItem>
          <CommandItem id="search-emoji">{t(($) => $.command.emoji)}</CommandItem>
          <CommandItem id="calculator" isDisabled>
            {t(($) => $.command.calculator)}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t(($) => $.command.settings)}>
          <CommandItem id="profile">
            {t(($) => $.command.profile)}
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem id="billing">
            {t(($) => $.command.billing)}
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FormExtrasCard() {
  const { t } = useTranslation("showcase");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(($) => $.form.title)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel>{t(($) => $.form.code)}</FieldLabel>
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
          <FieldLabel htmlFor="showcase-note">{t(($) => $.form.note)}</FieldLabel>
          <Textarea id="showcase-note" placeholder={t(($) => $.form.notePlaceholder)} />
        </Field>
        <Accordion defaultExpandedKeys={["refunds"]}>
          <AccordionItem id="refunds">
            <AccordionTrigger>{t(($) => $.form.refunds)}</AccordionTrigger>
            <AccordionContent>{t(($) => $.form.refundsText)}</AccordionContent>
          </AccordionItem>
          <AccordionItem id="cancel">
            <AccordionTrigger>{t(($) => $.form.cancel)}</AccordionTrigger>
            <AccordionContent>{t(($) => $.form.cancelText)}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function Showcase() {
  const { t } = useTranslation("showcase");
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
            <Calendar aria-label={t(($) => $.tabs.calendar)} />
          </CardContent>
        </Card>
        <ControlsCard />
        <CommandCard />
        <SurfacesCard />
        <Tabs defaultSelectedKey="overview">
          <TabsList>
            <TabsTrigger id="overview">{t(($) => $.tabs.overview)}</TabsTrigger>
            <TabsTrigger id="analytics">{t(($) => $.tabs.analytics)}</TabsTrigger>
            <TabsTrigger id="reports">{t(($) => $.tabs.reports)}</TabsTrigger>
          </TabsList>
          <TabsContent id="overview" className="text-muted-foreground">
            {t(($) => $.tabs.note)}
          </TabsContent>
          <TabsContent id="analytics">{t(($) => $.tabs.analytics)}</TabsContent>
          <TabsContent id="reports">{t(($) => $.tabs.reports)}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
