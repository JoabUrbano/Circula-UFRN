import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  MessageSquare,
  PlusCircle,
  User,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";
import ChatModal from "./ChatModal";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { to: "/", label: "Início", icon: Home },
    { to: "/meus-objetos", label: "Meus Objetos", icon: Package },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Package className="h-6 w-6 text-primary transition-transform duration-300" />
          </div>
          <span className="font-bold text-xl bg-[image:var(--gradient-hero)] from-primary to-purple-600 bg-clip-text text-transparent transition-opacity duration-300 group-hover:opacity-80">
            Circula UFRN
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/5 rounded-full hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChatOpen(true)}
            className="text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10 hover:scale-110 active:scale-95"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <div className="transition-transform duration-300 hover:scale-105 active:scale-95">
            <NotificationDropdown />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10 hover:scale-110 active:scale-95"
              size="icon"
              asChild
            >
              <Link to="/cadastrar-objeto">
                <PlusCircle className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all duration-300 hover:ring-primary/20 hover:scale-105"
                >
                  <Avatar className="h-9 w-9 transition-transform duration-300">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={profile?.nome_completo}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile?.nome_completo
                        ? getInitials(profile.nome_completo)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 animate-in fade-in zoom-in-95 duration-200"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.nome_completo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary"
                >
                  <Link to="/perfil" className="w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-transform duration-300 active:scale-90"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 animate-in spin-in-90 duration-300" />
            ) : (
              <Menu className="h-5 w-5 animate-in fade-in duration-300" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="container px-4 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile?.nome_completo
                    ? getInitials(profile.nome_completo)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{profile?.nome_completo}</span>
                <span className="text-xs text-muted-foreground">
                  {profile?.email}
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:translate-x-2 font-medium"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              <Link
                to="/cadastrar-objeto"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-300 hover:translate-x-2 font-medium"
              >
                <PlusCircle className="h-5 w-5" />
                Anunciar Objeto
              </Link>

              <Link
                to="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:translate-x-2 font-medium"
              >
                <User className="h-5 w-5" />
                Meu Perfil
              </Link>

              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-300 hover:translate-x-2 font-medium text-left"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}

      <ChatModal open={chatOpen} onOpenChange={setChatOpen} />
    </nav>
  );
};

export default Navbar;
