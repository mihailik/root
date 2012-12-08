using System;
using System.Collections.Generic;
using System.Linq;

namespace Mi.PE.Cli.Tables
{
    /// <summary>
    /// Look in ECMA-335 §22.11.
    /// </summary>
    public enum SecurityAction : ushort
    {
        /// <summary>
        /// Without further checks, satisfy Demand for the specified permission.
        /// Valid scope: Method, Type;
        /// </summary>
        Assert = 3,

        /// <summary>
        /// Check that all callers in the call chain have been granted specified permission,
        /// throw SecurityException (see ECMA-335 §Partition IV) on failure.
        /// Valid scope: Method, Type.
        /// </summary>
        Demand = 2,

        /// <summary>
        /// Without further checks refuse Demand for the specified permission.
        /// Valid scope: Method, Type.
        /// </summary>
        Deny = 4,
        
        /// <summary>
        /// The specified permission shall be granted in order to inherit from class or override virtual method.
        /// Valid scope: Method, Type 
        /// </summary>
        InheritanceDemand = 7,

        /// <summary>
        /// Check that the immediate caller has been granted the specified permission;
        /// throw SecurityException (see ECMA-335 §Partition IV) on failure.
        /// Valid scope: Method, Type.
        /// </summary>
        LinkDemand = 6,

        /// <summary>
        ///  Check that the current assembly has been granted the specified permission;
        ///  throw SecurityException (see Partition IV) otherwise.
        ///  Valid scope: Method, Type.
        /// </summary>
        NonCasDemand = 0, // TODO: find the correct value

        /// <summary>
        /// Check that the immediate caller has been granted the specified permission;
        /// throw SecurityException (see Partition IV) otherwise.
        /// Valid scope: Method, Type.
        /// </summary>
        NonCasLinkDemand = 0,  // TODO: find the correct value

        /// <summary>
        /// Reserved for implementation-specific use.
        /// Valid scope: Assembly.
        /// </summary>
        PrejitGrant = 0,  // TODO: find the correct value
 
        /// <summary>
        /// Without further checks, refuse Demand for all permissions other than those specified.
        /// Valid scope: Method, Type 
        /// </summary>
        PermitOnly = 5,

        /// <summary>
        /// Specify the minimum permissions required to run.
        /// Valid scope: Assembly.
        /// </summary>
        RequestMinimum = 8,
        
        /// <summary>
        /// Specify the optional permissions to grant.
        /// Valid scope: Assembly.
        /// </summary>
        RequestOptional = 9,

        /// <summary>
        /// Specify the permissions not to be granted.
        /// Valid scope: Assembly.
        /// </summary>
        RequestRefuse = 10
    }
}