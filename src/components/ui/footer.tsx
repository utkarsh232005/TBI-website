export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-center py-8 px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} InnoNexus. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Empowering the Next Generation of Innovators.
        </p>
      </div>
    </footer>
  );
}
