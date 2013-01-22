#!/usr/bin/ruby
#----------------------------------------------------------------------
# read a manifest file of JS file names, outputs a single Closure compiled
# file
#----------------------------------------------------------------------

closure = "/Users/dwhitney/Sites/compiler-latest/compiler.jar"
manifest = "Manifest"
output = ARGV[0] || "scripts_compiled.js"

#----------------------------------------
def readManifest( manifest )
  scriptList = [];
  file = File.new( manifest, "r")
  while (line = file.gets)
    line.strip!
    if not line.match("#") and not line.empty?
      scriptList.push( line )
    end
  end
  file.close
  return scriptList
end

#----------------------------------------
scripts = readManifest( manifest )
cmd = "java -jar #{closure} "
scripts.each do |script|
  cmd << " --js #{script}"
end
cmd << " --js_output_file=#{output}"

puts cmd

system( cmd );
