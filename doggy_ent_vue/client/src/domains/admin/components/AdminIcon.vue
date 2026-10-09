<script setup>
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  ExternalLink,
  FlaskConical,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  PackageCheck,
  PawPrint,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Ticket,
  Trash2,
  Truck,
  Users,
  X,
} from '@lucide/vue'
defineProps({ name: { type: String, required: true } })
const icons = {
  overview: LayoutDashboard,
  orders: PackageCheck,
  shipments: Truck,
  customers: Users,
  support: MessageSquare,
  products: Package,
  promos: Ticket,
  campaigns: HeartHandshake,
  notifications: Mail,
  reports: ChartNoAxesCombined,
  issues: ShieldAlert,
  brand: PawPrint,
  logout: LogOut,
  menu: Menu,
  external: ExternalLink,
  edit: Pencil,
  delete: Trash2,
  add: Plus,
  save: Save,
  refresh: RefreshCw,
  back: ArrowLeft,
  next: ArrowRight,
  plus: Plus,
  test: FlaskConical,
  close: X,
}
</script>
<template>
  <component
    :is="icons[name] || Package"
    :size="18"
    :stroke-width="1.6"
    aria-hidden="true"
    class="shrink-0"
  />
</template>
