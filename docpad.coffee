
# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration
docpadConfig = {
	# =================================
    # Server Configuration

    # Port
    # Use to change the port that DocPad listens to
    # By default we will detect the appropriate port number for our environment
    # if no environment port number is detected we will use 9778 as the port number
    # Checked environment variables are:
    # - PORT - Heroku, Nodejitsu, Custom
    # - VCAP_APP_PORT - AppFog
    # - VMC_APP_PORT - CloudFoundry
    port: 7777  # default
}

# Export the DocPad Configuration
module.exports = docpadConfig