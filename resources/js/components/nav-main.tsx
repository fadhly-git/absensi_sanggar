import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const getPath = (u?: string) => {
        if (!u) return '';
        try {
            // Handles absolute and relative URLs
            return new URL(u, typeof window !== 'undefined' ? window.location.href : 'http://localhost').pathname;
        } catch  {
            return u;
        }
    };

    useEffect(() => {
        const newOpenItems: Record<string, boolean> = {};

        const currentPath = getPath(page.url);
        items.forEach((item, index) => {
            const key = item.title + index;
            const shouldOpen =
                item.items?.some((sub) => currentPath.startsWith(getPath(sub.url))) || false;
            newOpenItems[key] = shouldOpen;
        });

        setOpenItems(newOpenItems);
    }, [page.url, items])

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item, index) => {
                    const key = item.title + index;
                    const currentPath = getPath(page.url);
                    const isActive =
                        (item.url && currentPath.startsWith(getPath(item.url))) ||
                        !!item.items?.some((sub) => currentPath.startsWith(getPath(sub.url)));

                    // Jika item memiliki sub-items
                    if (item.items && item.items.length > 0) {
                        return (
                                <Collapsible
                                    key={item.title + index}
                                    onOpenChange={(newOpen) =>
                                        setOpenItems((prev) => ({ ...prev, [key]: newOpen }))
                                    }
                                    className="group/collapsible"
                                    open={openItems[key] ?? false}
                                >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton isActive={isActive}>
                                            {item.icon && (
                                                <item.icon className="mr-2" />
                                            )}
                                            <span>{item.title}</span>
                                            <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                                            <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((sub) => {
                                                    const subActive = currentPath.startsWith(getPath(sub.url));

                                                return (
                                                    <Tooltip
                                                        key={sub.title}
                                                        delayDuration={200}
                                                    >
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuSubItem
                                                                key={sub.title}
                                                            >
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={
                                                                        subActive
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={
                                                                            sub.url
                                                                        }
                                                                        prefetch
                                                                    >
                                                                        {sub.icon && (
                                                                            <sub.icon className="mr-2" />
                                                                        )}
                                                                        <span>
                                                                            {
                                                                                sub.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {sub.title}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    // Jika item tidak punya sub-items
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url} prefetch>
                                    {item.icon && (
                                        <item.icon className="mr-2" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
